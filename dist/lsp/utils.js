export function shorten(value, max) {
    if (value.length <= max)
        return value;
    if (max <= 3)
        return ".".repeat(Math.max(0, max));
    return `${value.slice(0, max - 3)}...`;
}
export function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export function handleMissingDependencyError(error) {
    const message = errorMessage(error);
    return message.includes("NOT INSTALLED") || message.includes("No LSP server configured") ? message : null;
}
//# sourceMappingURL=utils.js.map