const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const ScoresSchema = new Schema({
    school_code: String,
    school_setting: String,
    school_type: String,
    teaching_method: String,
    student_id: String,
    gender: String,
    pretest: BigInt,
    posttest: BigInt
});
const Scores = mongoose.model('Scores',ScoresSchema);
module.exports = Scores