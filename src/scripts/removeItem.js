const remove = (openedOrders, order) => {
    const array = openedOrders.filter((item) => {
        return item !== order
    })
    return array;
}

export default remove;