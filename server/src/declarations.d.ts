
declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                sessionId: string;
            };
            isFirstSync?: boolean;
            files?: any;
            clerkClient?: any;
        }
    }
}

declare module 'express-fileupload' {
    import { RequestHandler } from 'express';

    export interface UploadedFile {
        name: string;
        data: Buffer;
        size: number;
        encoding: string;
        tempFilePath: string;
        truncated: boolean;
        mimetype: string;
        md5: string;
        mv(path: string, callback: (err: any) => void): void;
        mv(path: string): Promise<void>;
    }

    export interface FileArray {
        [fieldname: string]: UploadedFile | UploadedFile[];
    }

    interface Options {
        debug?: boolean;
        safeFileNames?: boolean | RegExp;
        preserveExtension?: boolean | number;
        abortOnLimit?: boolean;
        responseOnLimit?: string;
        limitHandler?: any;
        createParentPath?: boolean;
        parseNested?: boolean;
        useTempFiles?: boolean;
        tempFileDir?: string;
        defCharset?: string;
        defParamCharset?: string;
        limits?: {
            fileSize?: number;
        };
    }

    function fileUpload(options?: Options): RequestHandler;
    export default fileUpload;
}

declare module 'cors';
declare module 'compression';

export { };
