import * as FS from 'fs';
import { url_t, path_t } from "../../common/types"

/**
 * if file NOT exist,return undefined instantly;
 */
export function ReadFileUTF8(fileURL: url_t, cb?: Function): string | undefined {
    if (IsFileOrFolderExist(fileURL)) {
        if (cb) {
            FS.readFile(fileURL, "utf8", (err, data) => {
                if (err) {
                    cb(null);
                } else {
                    cb(data);
                }
            });
        } else {
            let file = FS.readFileSync(fileURL, "utf8");
            return file;
        }
    }
};

export function IsFileOrFolderExist(fileURL: url_t | path_t): boolean {
    return FS.existsSync(fileURL);
};


/**
 * create folder if NOT exist,
 * can create hierarchical folders;
 * return true if creating;
 * return false if already exist.
 */
export function CreateFolderIfNotExist(folderPath: path_t): boolean {
    if (FS.existsSync(folderPath)) return false;
    FS.mkdirSync(folderPath, { recursive: true })
    return true;
};
export function CreateFolder(folderPath: path_t): void {
    FS.mkdirSync(folderPath, { recursive: true })
};

/**
 * can delete recursivly
 */
export function DeleteFolder(folderPath: path_t): void {
    FS.rmSync(folderPath, { recursive: true });
}

export function ReadAllFileNamesInFolder(folderPath: path_t, prefix: string = ""): Array<url_t> {
    let out: Array<url_t> = [];
    let files = FS.readdirSync(folderPath);
    files.map(file => {
        const fileURL = folderPath + file;
        let stat = FS.statSync(fileURL);
        if (!stat.isDirectory()) {
            out.push(prefix + file);
        }
    });
    return out;
};

/**
 * if file exist, delete it and return true;
 * otherwise return false;
 * @param {boolean}
 */
export function DeleteFile(fileURL: url_t): boolean {
    if (IsFileOrFolderExist(fileURL)) {
        FS.unlinkSync(fileURL);
        return true;
    } else return false;
};

export function WriteFileUTF8(fileURL: url_t, data: string, extension: string = "", cb?: Function): boolean {
    if (cb) {
        FS.writeFile(fileURL, data, (err) => {
            if (err) {
                cb(false)
            } else {
                cb(true);
            }
        });
    } else {
        FS.writeFileSync(fileURL + extension, data);
    }
    return true;
};

