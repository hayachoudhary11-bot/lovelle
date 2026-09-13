import mongoose from "mongoose";
export declare const ChallengeAnswer: mongoose.Model<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    answeredBy: mongoose.Types.ObjectId;
    answerText: string;
    questionId: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=ChallengeAnswer.d.ts.map