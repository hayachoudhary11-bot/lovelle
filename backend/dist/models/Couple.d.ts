import mongoose from "mongoose";
export declare const Couple: mongoose.Model<{
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    members: mongoose.Types.ObjectId[];
    inviteCode: string;
    currentStreak: number;
    longestStreak: number;
    name?: string | null | undefined;
    featuredPhotoId?: mongoose.Types.ObjectId | null | undefined;
    relationshipStartDate?: NativeDate | null | undefined;
    lastNoteDate?: NativeDate | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Couple.d.ts.map