import mongoose from "mongoose";
export declare const Event: mongoose.Model<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
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
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    date: NativeDate;
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    isCountdown: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Event.d.ts.map