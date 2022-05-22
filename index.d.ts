export = QueryMap;
declare class QueryMap {
    constructor({ errorOnDuplicate, keyProperty, data }: {
        errorOnDuplicate?: boolean;
        keyProperty?: string;
        data?: any[];
    });
    options: {
        errorOnDuplicate: boolean;
        keyProperty: string;
    };
    find(query: any, options?: {}): any;
    findOne(query: any, options: any): any;
    remove(query: any): number;
    update(query: any, iteree: any): any;
    insert(doc: any): boolean;
    findAllSortedByKey(query?: {}): any;
    replaceData(newData: any): void;
}
