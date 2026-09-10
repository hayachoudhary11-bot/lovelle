import mongoose from "mongoose";
export declare const Photo: mongoose.Model<{
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    coupleId: mongoose.Types.ObjectId;
    uploaderId: mongoose.Types.ObjectId;
    cloudinaryPublicId: string;
    url: string;
    thumbUrl: string;
    caption: string;
    width: number;
    height: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Photo.d.ts.map