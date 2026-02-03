export function getPagination(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return { skip, limit };
}
