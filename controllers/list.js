const {Task} = require("../models");
const {User} = require("../models")


/**
 *
 * @param req request (GET)
 * @param res response
 * @returns {Promise<void>} takes the taskId input from the request path parameters,
 * finds all subtasks whose parent task is this taskId, then it returns those tasks in its response.
 * 404 status code is returned if the parent task is not found or if no subtasks found,
 * 200 in case a task has subtasks,
 * or 500 in case of unexpected errors.
 *
 */
const getSubtasksOfTask = async (req, res) => {
    // taskId from path parameters
    const {taskId} = req.params;
    try {
        // find the parent task first by that id
        const parentTask = await Task.findById(taskId);
        // if no parent task is found -> resource not found 400 -> halt
        if (!parentTask) {
            res.status(404).json({
                status: "failure",
                message: "no such task"
            });
        } else {
            // find the subtasks of a task by querying the parent_task field
            const subtasks = await Task.find({parent_task: taskId});
            // if no subtasks found -> resource not found 400 -> return response
            if (!subtasks) {
                res.status(404).json({
                    status: "failure",
                    message: "no sub tasks for this task"
                });
            } else {
                // subtasks found -> 200 success
                res.status(200).json({
                    status: "success",
                    message: `the following subtasks belong to the task ${taskId}`,
                    subtasks: subtasks
                });
            }
        }
    } catch (error) {
        // handle unexpected errors.
        res.status(500).json({
            status: 'failure',
            message: 'failed to get results'
        });
    }
};

/**
 *
 * @param req request (GET)
 * @param res response
 * @returns {Promise<void>} calculates the ratio of total completed tasks to the total number of tasks, the daily completion rate, and prints the tasks which are completed.
 */
const getSystemStatistics = async (req, res) => {
    // validated by the auth middleware
    const userId = req.userData.userId;
    try {
        // check the userid
        // i actually don't think that this scenario would ever occur since this is token authentication
        const user = await User.findById(userId);
        if (user) {
            const pipeline = [
                // get the tasks of this user by its id
                {$match: {userid: user._id}},
                {$sort: {createdAt: 1}},
                {
                    // for this group you've filtered:
                    $group: {
                        _id: null,
                        // total task count is the sum, whenever a task is found add one
                        totalTasksCount: {$sum: 1},
                        // completed task count is the sum, whenever a task has status:completed add 1, if not add 0.
                        completedTasksCount: {
                            $sum: {$cond: [{$eq: ["$status", "completed"]}, 1, 0]},
                        },
                        // push the tasks to task array
                        tasks: {$push: "$$ROOT"},
                        // the oldest task in the list
                        oldestTask: {$first: "$$ROOT"},
                    },
                },
                {
                    // get the totalTasksCount, completedTasksCount, completed tasks fields only.
                    $project: {
                        _id: 0,
                        totalTasksCount: 1,
                        completedTasksCount: 1,
                        completedTasks: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: {$eq: ["$$task.status", "completed"]}
                            }
                        },
                        oldestTask: 1,
                    },
                },
            ];
            // performs the aggregation
            const userTasks = await Task.aggregate(pipeline);
            // if the length of the array returned is more than zero -> keep going
            if (userTasks.length > 0) {
                const totalTasksCount = userTasks[0].totalTasksCount;
                const completedTasksCount = userTasks[0].completedTasksCount;
                const completedTasks = userTasks[0].completedTasks;
                const oldestTask = userTasks[0].oldestTask;
                // NOTE: this is the ratio of completion
                const ratio = (completedTasksCount / totalTasksCount) * 100;
                // NOTE: this is the daily completion average
                const periodInDays = (Date.now() - oldestTask.createdAt)/86400000;
                const dailyRatio = (completedTasksCount/ periodInDays) * 100;
                // completed tasks and their ratio are found -> success
                res.status(200).json({
                    status: "success",
                    message: `total completed task ratio has been calculated successfully`,
                    ratio: ratio,
                    completedTasks: completedTasks,
                    dailyRatio: dailyRatio
                });
            } else {
                // if no completed tasks -> the resource is not actually found -> failure
                res.status(404).json({
                    status: 'failure',
                    message: 'user has no tasks'
                });
            }
        } else {
            // this is the scenario that i can't imagine happening
            res.status(404).json({
                status: 'failure',
                message: 'user not found'
            });
        }
    } catch (error) {
        // handle the unexpected errors
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

}
/**
 *
 * @param req request (PUT)
 * @param res response
 * @returns {Promise<void>} recieves a taskId from request path parameters, checks all subtasks of this task and treats them as a single unit.
 * In order to update this task status to completed, all of its subtasks statuses must be updated to completed as well in order to ensure data consistency
 *
 */
const markAsCompleted = async (req, res) => {
    const {taskId} = req.params;
    try {
        // treat this operation as a transaction, so that if one subtask update failed -> rollback the whole operation
        // I actually don't know what kind of scenario that could lead to such thing except for database errors
        // start the transaction session
        const session = await Task.startSession();
        await session.withTransaction(async () => {
                // find the task you want to update
                const taskToUpdate = await Task.findById(taskId).session(session);
                // if you can't find it -> resource not found -> halt the process
                if (!taskToUpdate) {
                    res.status(404).json({
                        status: "failure",
                        message: "no such task found"
                    });
                    return;
                } else {
                    // get the subtasks of this parent task you've fetched in the first place
                    const subtasks = await Task.find({parent_task: taskToUpdate._id}).lean().session(session);
                    // if it has other subtasks  * here's the big deal *
                    if (subtasks.length > 0) {
                        // map each subtask object to its id
                        const subtasksIds = subtasks.map(subtask => subtask._id);
                        // update each one of these subtasks status to completed
                        const result = await Task.updateMany({_id: {$in: subtasksIds}}, {status: "completed"}, {session});
                        const numberOfUpdatedSubtasks = result.modifiedCount;
                        // in order for this transaction to be successful -> the modified number of rows must be equal to the original number of fetched subtasks
                        if (numberOfUpdatedSubtasks === subtasks.length) {
                            // the transaction succeeded -> update the parent task status to completed and return success
                            await Task.findByIdAndUpdate(taskToUpdate._id, {status: "completed"}).session(session);
                            res.status(200).json({
                                status: "success",
                                message: "task and its subtasks have been updated successfully",
                                updatedSubtasks: numberOfUpdatedSubtasks
                            });
                        } else {
                            // the whole transaction fails and the transaction must be rolled back.
                            throw new Error("Failed to update all subtasks, transaction is rollback");
                        }
                    } else {
                        // if it's just one task with no subtasks, update it with no need to maintain session
                        await Task.findByIdAndUpdate(taskToUpdate._id, {status: "completed"});
                        res.status(200).json({
                            status: "success",
                            message: "task has been updated successfully",

                        })
                    }
                }
            }
        )
        session.endSession();
    } catch (error) {
        // handle the unexpected errors.
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

};



module.exports = {
    getSubtasksOfTask,
    getSystemStatistics,
    markAsCompleted,
}


