import { Query } from 'mingo';
import { Cursor } from 'mingo/cursor';
import { Callback, RawObject } from 'mingo/types';
export class QueryMap<Type = Record<string, unknown>> extends Map<string, Type> {
  options: {
    errorOnDuplicate: boolean;
    keyProperty: string;
  };

  constructor({
    errorOnDuplicate = true,
    keyProperty = '_id',
    data = [],
  }: {
    errorOnDuplicate?: boolean;
    keyProperty?: string;
    data?: [string, Type][] | Type[];
  }) {
    if (data.length > 0) {
      /* we have been passed some starting data */
      /* is it in the format that Map wants, or do we need to fix it? */

      if (Array.isArray(data[0]) && data[0].length === 2) {
        /* appears to be k-v pairs - proceed */
        super(data as [string, Type][]);
      } else if (typeof data[0] === 'object') {
        /* we need to transform the data */
        if ((data[0] as Record<string, unknown>)[keyProperty]) {
          super(
            (data as Record<string, unknown>[]).map((x) => {
              if (x[keyProperty] instanceof Date) {
                return [(x[keyProperty] as Date).getTime(), x];
              } else {
                return [x[keyProperty], x];
              }
            }) as [string, Type][],
          );
        } else {
          throw new Error('Could not find key property to populate QueryMap');
        }
      } else {
        throw new Error('Invalid data passed to QueryMap');
      }
    } else {
      super();
    }

    this.options = {
      errorOnDuplicate,
      keyProperty,
    };
  }

  find(query: Record<string, unknown> = {}, options: { sort?: Record<string, number>; limit?: number } = {}): Cursor {
    const mingoQuery = new Query(query);
    let cursor = mingoQuery.find(Array.from(this.values()));

    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    return cursor;
  }

  findOne(
    query: Record<string, unknown> = {},
    options: { sort?: Record<string, number>; limit?: number } = {},
  ): Type | undefined {
    const docs: Type[] = this.find(query, {
      ...options,
      limit: 1,
    }).all() as Type[];

    return docs.length > 0 ? docs[0] : undefined;
  }

  remove(query: Record<string, unknown> = {}) {
    const mingoQuery = new Query(query);

    let deletedDocuments = 0;

    this.forEach((doc, key) => {
      if (mingoQuery.test(doc as RawObject)) {
        this.delete(key);
        deletedDocuments += 1;
      }
    });

    return deletedDocuments;
  }

  update(query: Record<string, unknown> = {}, iteree: Callback<unknown, unknown>) {
    const cursor = this.find(query);
    cursor.forEach(iteree);

    return cursor.count();
  }

  insert(doc: Type) {
    let k: string;
    let v: Type;

    if (Array.isArray(doc) && doc.length === 2) {
      /* appears to be k-v pairs - proceed */
      [k, v] = doc;
    } else if (typeof doc === 'object') {
      /* we need to transform the data */
      if ((doc as Record<string, unknown>)[this.options.keyProperty]) {
        if ((doc as Record<string, unknown>)[this.options.keyProperty] instanceof Date) {
          k = ((doc as Record<string, unknown>)[this.options.keyProperty] as Date).getTime().toString();
        } else {
          k = ((doc as Record<string, unknown>)[this.options.keyProperty] as any).toString();
        }

        v = doc;
      } else {
        throw new Error('Could not find key property in document');
      }
    } else {
      throw new Error('Invalid data passed to QueryMap');
    }

    if (this.has(k) && this.options.errorOnDuplicate) {
      throw new Error('Key already has a value');
    }

    this.set(k, v);

    return true;
  }

  findAllSortedByKey(query = {}) {
    const sortObject: Record<string, number> = {};
    sortObject[this.options.keyProperty] = 1;

    return this.find(query, {
      sort: sortObject,
    }).all();
  }

  replaceData(data: [string, Type][] | Type[]) {
    const processData = (newData: [string, Type][]) => {
      newData.forEach(([k, v]: [k: string, v: Type]) => {
        this.set(k, v);
      });

      Array.from(this.keys()).forEach((key) => {
        if (!newData.find(([k, v]: [k: string, v: Type]) => k === key)) this.delete(key);
      });
    };

    if (data.length > 0) {
      /* we have been passed some starting data */
      /* is it in the format that Map wants, or do we need to fix it? */

      if (Array.isArray(data[0]) && data[0].length === 2) {
        /* appears to be k-v pairs - proceed */
        processData(data as [string, Type][]);
      } else if (typeof data[0] === 'object') {
        /* we need to transform the data */
        if ((data[0] as Record<string, unknown>)[this.options.keyProperty]) {
          processData(
            (data as Record<string, unknown>[]).map((x) => {
              if (x[this.options.keyProperty] instanceof Date) {
                return [(x[this.options.keyProperty] as Date).getTime(), x];
              } else {
                return [x[this.options.keyProperty], x];
              }
            }) as [string, Type][],
          );
        } else {
          throw new Error('Could not find key property to populate QueryMap');
        }
      } else {
        throw new Error('Invalid data passed to QueryMap');
      }
    }
  }
}
