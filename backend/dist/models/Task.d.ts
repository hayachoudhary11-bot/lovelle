import mongoose from "mongoose";
export declare const Task: mongoose.Model<{
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    text: string;
    coupleId: mongoose.Types.ObjectId;
    done: boolean;
    createdBy: mongoose.Types.ObjectId;
    doneBy?: mongoose.Types.ObjectId | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Task.d.ts.map