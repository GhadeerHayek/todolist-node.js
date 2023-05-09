const {Task} = require("../models");
const {User} = require("../models")


const getSubtasksOfTask = async (req, res) => {
    const {taskId} = req.params;
    try {
        const parentTask = await Task.findById(taskId);
        if (!parentTask) {
            res.status(404).json({
                status: "failure",
                message: "no such task"
            });
        } else {
            const subtasks = await Task.find({parent_task: taskId});
            if (!subtasks) {
                res.status(404).json({
                    status: "failure",
                    message: "no sub tasks for this task"
                });
            } else {
                res.status(200).json({
                    status: "success",
                    message: `the following subtasks belong to the task ${taskId}`,
                    subtasks: subtasks
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            status: 'failure',
            message: 'failed to get results'
        });
    }
};

// calculate the ratio of the completed tasks and show these tasks
const completedTasksRatio = async (req, res) => {
    // validated by the auth middleware
    const userid = req.userData.userId;
    try {
        // check the userid
        // i actually don't think that this scenario would ever occur since this is token authentication
        const user = await User.findById(userid);
        if (user) {
            const pipeline = [
                {$match: {userid: user._id}},
                {
                    $group: {
                        _id: null,
                        totalTasksCount: {$sum: 1},
                        completedTasksCount: {
                            $sum: {$cond: [{$eq: ["$status", "completed"]}, 1, 0]},
                        },
                        tasks: {$push: "$$ROOT"},
                    },
                },
                {
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
                        }
                    },
                },
            ];
            const userTasks = await Task.aggregate(pipeline);
            if (userTasks.length > 0) {
                const totalTasksCount = userTasks[0].totalTasksCount;
                const completedTasksCount = userTasks[0].completedTasksCount;
                const completedTasks = userTasks[0].completedTasks;
                const ratio = completedTasksCount / totalTasksCount * 100;
                res.status(200).json({
                    status: "success",
                    message: `total completed task ratio has been calculated successfully`,
                    ratio: ratio,
                    completedTasks: completedTasks
                });
            } else {
                res.status(404).json({
                    status: 'failure',
                    message: 'user has no tasks'
                });
            }
        } else {
            res.status(404).json({
                status: 'failure',
                message: 'user not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

}

const markAsCompleted = async (req, res) => {
    const {taskId} = req.params;
    try {
        // treat this operation as a transaction, so that if one subtask update failed -> rollback the whole operation
        // I actually don't know what kind of scenario that could lead to such thing except for database errors
        const session = await Task.startSession();
        await session.withTransaction(async () => {
                const taskToUpdate = await Task.findById(taskId).session(session);
                if (!taskToUpdate) {
                    res.status(404).json({
                        status: "failure",
                        message: "no such task found"
                    });
                    return;
                } else {
                    const subtasks = await Task.find({parent_task: taskId}).lean().session(session);
                    if (subtasks.length > 0) {
                        const subtasksIds = subtasks.map(subtask => subtask._id);
                        const result = await Task.updateMany({_id: {$in: subtasksIds}}, {status: "completed"}, {session});
                        const numberOfUpdatedSubtasks = result.modifiedCount;
                        if (numberOfUpdatedSubtasks === subtasks.length) {
                            await Task.findByIdAndUpdate(taskToUpdate._id, {status: "completed"}).session(session);
                            res.status(200).json({
                                status: "success",
                                message: "task and its subtasks have been updated successfully",
                                updatedSubtasks: numberOfUpdatedSubtasks
                            });
                        } else {
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
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

};


// the ratio of completion per day
// a day is sent, then you've got to select the tasks which their status is completed and the completion time is equal to the sent one
// you need a ratio, so it's the first count divided by the total count of tasks of this user

const completionMeanByDay = async (req, res) => {
    // validated by the auth middleware
    const userid = req.userData.userId;
    // validated by the task middleware
    const {completion_time} = req.query;
    try {
        // check the userid
        const user = await User.findById(userid);
        console.log(user);
        if (user) {
            const pipeline = [
                {$match: {userid: user._id}},
                {
                    $group: {
                        _id: null,
                        totalTasksCount: {$sum: 1},
                        completedTasksPerDayCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            {$eq: ["$status", "completed"]},
                                            {$eq: ["$completion_time", new Date(completion_time)]}
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        tasks: {$push: "$$ROOT"},
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalTasksCount: 1,
                        completedTasksPerDayCount: 1,
                        completedTasks: {
                            $filter: {
                                input: "$tasks",
                                as: "task",
                                cond: {$eq: ["$$task.status", "completed"]}
                            }
                        }
                    },
                },
            ];
            const userTasks = await Task.aggregate(pipeline);
            console.log(userTasks);
            if (userTasks.length > 0) {
                const totalTasksCount = userTasks[0].totalTasksCount;
                const completedTasksPerDayCount = userTasks[0].completedTasksPerDayCount;
                const completedTasks = userTasks[0].completedTasks;
                const ratio = completedTasksPerDayCount / totalTasksCount * 100;
                res.status(200).json({
                    status: "success",
                    message: `total completed task ratio per day has been calculated successfully`,
                    completion_time: completion_time,
                    ratio: ratio,
                    completedTasks: completedTasks
                });
            } else {
                res.status(404).json({
                    status: 'failure',
                    message: 'user has no tasks'
                });
            }
        } else {
            res.status(404).json({
                status: 'failure',
                message: 'user not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

    // main goal of this function, that if a task is a parent task and its status is completed,
    // then all of its subtasks must be marked as completed too.

}




module.exports = {
    getSubtasksOfTask,
    completedTasksRatio,
    completionMeanByDay,
    markAsCompleted,
}


