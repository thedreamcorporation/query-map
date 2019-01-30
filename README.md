# QueryMap
Extension of Map to integrate MongoDB query language via [mingo](https://github.com/kofrasa/mingo) with Minimongo-style methods

## Usage
Examples:

```js
import QueryMap from '@tdc/query-map'

const map = new QueryMap({
    data: [{
        date: new Date('2018-04-01'),
        value: 10
    },{
        date: new Date('2018-05-01'),
        value: 15
    },{
        date: new Date('2018-06-01'),
        value: 29
    },{
        date: new Date('2018-07-01'),
        value: 13
    },{
        date: new Date('2018-08-01'),
        value: 9
    }],
    keyProperty: 'date'
})

map.remove({
    date: {
        $gt: new Date('2018-06-01')
    }
})

map.insert({
    date: new Date('2018-12-01'),
    value: 33
})

console.log([...map])
```

## License
MIT
