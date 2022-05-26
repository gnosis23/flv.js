import {DataSourceRange} from './loader';

export interface SeekHandler {

  getConfig(url: string, range: DataSourceRange): { url: string, headers: {} };

  removeURLParameters(seekedURL: string): string;

}

export interface CustomSeekHandlerConstructor {

  new(): SeekHandler;

}
