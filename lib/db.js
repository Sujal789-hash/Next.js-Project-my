// Backwards-compatible alias. All connection logic now lives in ./mongodb
// so there is only one cached connection and one set of environment checks.
export { default } from './mongodb';
