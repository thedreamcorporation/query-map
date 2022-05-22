const mingo = require('mingo')

class QueryMap extends Map {
    constructor({ errorOnDuplicate = true, keyProperty = '_id', data = [] }) {
        if (data.length > 0) {
            /* we have been passed some starting data */
            /* is it in the format that Map wants, or do we need to fix it? */

            if (Array.isArray(data[0]) && data[0].length === 2) {
                /* appears to be k-v pairs - proceed */
                super(data)
            } else if (typeof data[0] === 'object') {
                /* we need to transform the data */
                if (data[0][keyProperty]) {
                    super(data.map(x => {
                        if (x[keyProperty] instanceof Date) {
                            return [x[keyProperty].getTime(), x]
                        } else {
                            return [x[keyProperty], x]
                        }                        
                    }))
                } else {
                    throw new Error('Could not find key property to populate QueryMap')
                }
            } else {
                throw new Error('Invalid data passed to QueryMap')
            }
        } else {
            super()
        }

        this.options = {
            errorOnDuplicate,
            keyProperty
        }
    }

    find(query, options = {}) {
        let cursor = mingo.find(this.values(), query)

        if (options.sort) {
            cursor = cursor.sort(options.sort)
        }

        if (options.limit) {
            cursor = cursor.limit(options.sort)
        }

        return cursor
    }

    findOne(query, options) {
        const docs = this.find(query, {
            ...options,
            limit: 1
        }).all()

        return docs.length > 0 ? all[0] : undefined
    }

    remove(query) {
        const mingoQuery = new mingo.Query(query)

        let deletedDocuments = 0

        this.forEach((doc, key) => {
            if (mingoQuery.test(doc)) {
                this.delete(key)
                deletedDocuments += 1
            }
        })

        return deletedDocuments
    }

    update(query, iteree) {
        const cursor = this.find(query)
        cursor.forEach(iteree)

        return cursor.count()
    }

    insert(doc) {
        let k, v;

        if (Array.isArray(doc) && doc.length === 2) {
            /* appears to be k-v pairs - proceed */
            [k, v] = doc;
        } else if (typeof doc === 'object') {
            /* we need to transform the data */
            if (doc[this.options.keyProperty]) {
                if (doc[this.options.keyProperty] instanceof Date) {
                    k = doc[this.options.keyProperty].getTime()
                } else {
                    k = doc[this.options.keyProperty]
                }

                v = doc
            } else {
                throw new Error('Could not find key property in document')
            }
        } else {
            throw new Error('Invalid data passed to QueryMap')
        }

        if (this.has(k) && this.options.errorOnDuplicate) {
            throw new Error('Key already has a value')
        }

        this.set(k, v)

        return true
    }

    findAllSortedByKey(query = {}) {
        const sortObject = {}
        sortObject[this.options.keyProperty] = 1

        return this.find(query, {
            sort: sortObject
        }).all()
    }

    replaceData(newData) {
        newData.forEach(doc => {
            this.set(doc[this.options.keyProperty], doc)
        })

        this.keys.forEach((key) => {
            if (!newData.find(doc => doc[this.options.keyProperty] === key)) {
                this.delete(key)
            }
        })
    }
}

module.exports = QueryMap
