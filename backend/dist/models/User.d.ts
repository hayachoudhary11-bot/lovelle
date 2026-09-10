import mongoose from "mongoose";
export declare const User: mongoose.Model<{
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    email: string;
    name: string;
    passwordHash: string;
    coupleId?: mongoose.Types.ObjectId | null | undefined;
    pushToken?: string | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=User.d.ts.map