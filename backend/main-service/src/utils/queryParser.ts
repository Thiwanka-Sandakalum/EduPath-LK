export function parseSort(sort: string = 'name:asc') {
    const [field, order] = sort.split(':');
    return { [field]: order === 'desc' ? -1 : 1 };
}
