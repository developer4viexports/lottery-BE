export function generateTicketID() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `SLH-2025-${rand}`;
}

export function generateTicketNumbers() {
    const set = new Set();
    while (set.size < 7) {
        set.add(Math.floor(Math.random() * 100).toString().padStart(2, "0"));
    }
    return [...set];
}
