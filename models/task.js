const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
    userid: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        required: true,
        type: String
    },
    description: {
        required: false,
        type: String,
        default: ""
    },
    completion_time: {
        required: false,
        type: Date,
        default: null
    },
    status: {
        required: true,
        type: String,
        default: "new",
        enum: {
            values: ['new', 'in_progress', 'completed'],
            message: 'not valid',
        },
    },
    rank: {
        required: true,
        type: Number,
        default: 1
    },
    is_subtask: {
        required: true,
        type: Number,
        max: 1,
        min: 0
    },
    parent_task: {
        required: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tasks'
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;