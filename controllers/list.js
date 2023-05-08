const {Task} = require("../models");
const {User} = require("../models")
const mongoose = require("mongoose");

const getSubtasksOfTask = async (req, res) => {
    const {taskId} = req.params;
    try {
        const subtasks = await Task.find({parent_task: taskId});
        if (!subtasks) {
            res.status(404).json({
                status: "failure",
                message: "no sub tasks for this task"
            });
        }
        res.status(200).json({
            status: "success",
            message: `the following subtasks belong to the task ${taskId}`,
            subtasks: subtasks
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to get results'
        });
    }
};

/*
const markAsCompleted = async (req, res) => {
    const {taskId} = req.params;
    try {
        const task = await Task.findOneAndUpdate(taskId, req.body);
        if (!task) {
            res.status(404).json({
                status: "failure",
                message: "no task found"
            });
        }
        res.status(200).json({
            status: "success",
            message: `the following task ${taskId} status has been updated`,
            task: await Task.findById(taskId)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to update status'
        });
    }
};

//NOTE: pretty much the same as the update route
 */

// calculate the ratio of the completed tasks and show these tasks

const completedTasksRatio = async (req, res, next) => {
    const {userid} = req.query;
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
            console.log(userTasks);
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
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

}

// the ratio of completion per day
// a day is sent, then you've got to select the tasks which their status is completed and the completion time is equal to the sent one
// you need a ratio, so it's the first count divided by the total count of tasks of this user

const completionMeanByDay = async (req, res, next) => {
    const {userid} = req.query;
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
    } catch
        (error) {
        console.log(error);
        res.status(500).json({
            status: 'failure',
            message: 'failed to fetch results'
        });
    }

}
module.exports = {
    getSubtasksOfTask,
    completedTasksRatio,
    completionMeanByDay
}


