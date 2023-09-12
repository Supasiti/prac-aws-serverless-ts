
export const tsJestConfig = {
    tsconfig: 'tsconfig.json',
    isolatedModules: true, // Disables type checking --> faster!
    useESM: true,
};

const config = {
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.(spec|test).(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', tsJestConfig]
    },
    preset: 'jest-dynalite',
    verbose: true,
};

export default config
