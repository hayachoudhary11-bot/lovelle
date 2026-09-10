import mongoose from "mongoose";
export declare const DrawingStroke: mongoose.Model<{
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
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
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, unknown, {
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    coupleId: mongoose.Types.ObjectId;
    color: string;
    points: mongoose.Types.DocumentArray<{
        y: number;
        x: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.ObjectId, unknown, {
        y: number;
        x: number;
    }, {}, {}> & {
        y: number;
        x: number;
    }>;
    strokeWidth: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=DrawingStroke.d.ts.map