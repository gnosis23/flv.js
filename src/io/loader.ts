/*
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {SeekHandler} from "./seek-handler";
import type {FlvConfig} from "../config";

export enum LoaderStatus {
    kIdle = 0,
    kConnecting,
    kBuffering,
    kError,
    kComplete,
}

export enum LoaderErrors {
    OK = 'OK',
    EXCEPTION = 'Exception',
    HTTP_STATUS_CODE_INVALID = 'HttpStatusCodeInvalid',
    CONNECTING_TIMEOUT = 'ConnectingTimeout',
    EARLY_EOF = 'EarlyEof',
    UNRECOVERABLE_EARLY_EOF = 'UnrecoverableEarlyEof'
}

export type DataSource = {

    url: string;

    withCredentials?: boolean;

    cors?: boolean;

    redirectedURL?: string;

    referrerPolicy?: ReferrerPolicy;

    filesize?: number;

};

export type DataSourceRange = {

    from: number;

    to: number;

};

export interface CustomLoaderConstructor {
    new(seekHandler: SeekHandler, config: FlvConfig): BaseLoader;
}

/* Loader has callbacks which have following prototypes:
 *     function onContentLengthKnown(contentLength: number): void
 *     function onURLRedirect(url: string): void
 *     function onDataArrival(chunk: ArrayBuffer, byteStart: number, receivedLength: number): void
 *     function onError(errorType: number, errorInfo: {code: number, msg: string}): void
 *     function onComplete(rangeFrom: number, rangeTo: number): void
 */
export class BaseLoader {
    _type: string;
    _status: LoaderStatus;
    _needStash: boolean;
    // callbacks
    _onContentLengthKnown?: (len: number) => void;
    _onURLRedirect?: (url: string) => void;
    _onDataArrival?: (chunk: ArrayBufferLike, byteStart: number, receivedLength: number) => void;
    _onError?: (error: LoaderErrors, data: { code: number, msg: any }) => void;
    _onComplete?: (from: number, to: number) => void;

    constructor(typeName: string) {
        this._type = typeName || 'undefined';
        this._status = LoaderStatus.kIdle;
        this._needStash = false;
        // callbacks
        this._onContentLengthKnown = null;
        this._onURLRedirect = null;
        this._onDataArrival = null;
        this._onError = null;
        this._onComplete = null;
    }

    destroy() {
        this._status = LoaderStatus.kIdle;
        this._onContentLengthKnown = null;
        this._onURLRedirect = null;
        this._onDataArrival = null;
        this._onError = null;
        this._onComplete = null;
    }

    isWorking() {
        return this._status === LoaderStatus.kConnecting || this._status === LoaderStatus.kBuffering;
    }

    get type() {
        return this._type;
    }

    get status() {
        return this._status;
    }

    get needStashBuffer() {
        return this._needStash;
    }

    get onContentLengthKnown() {
        return this._onContentLengthKnown;
    }

    set onContentLengthKnown(callback) {
        this._onContentLengthKnown = callback;
    }

    get onURLRedirect() {
        return this._onURLRedirect;
    }

    set onURLRedirect(callback) {
        this._onURLRedirect = callback;
    }

    get onDataArrival() {
        return this._onDataArrival;
    }

    set onDataArrival(callback) {
        this._onDataArrival = callback;
    }

    get onError() {
        return this._onError;
    }

    set onError(callback) {
        this._onError = callback;
    }

    get onComplete() {
        return this._onComplete;
    }

    set onComplete(callback) {
        this._onComplete = callback;
    }

    // pure virtual
    open(dataSource: DataSource, range: DataSourceRange) {}

    abort() {}


}