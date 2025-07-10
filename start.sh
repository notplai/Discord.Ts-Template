#!/bin/bash

# Check Node.js version
NODE_VERSION=$(node -v | cut -d. -f1 | cut -c2-)

OutputText() {
    # Display ASCII art or other output
    cat ./assets/taag
    echo "(NodeJS) Node Version: $NODE_VERSION"
}

OutputText


# Function to execute if Node version is >= 20
run_if_node_ge_20() {
    echo '(TScript): Ignored TypeScriptCompiling!'
    echo '(JScript): Ignored JavaScript Executor!'
    echo '(TScript): Executing TypeScript with JavaScript Node...'

    node --no-warnings=ExperimentalWarning --loader ts-node/esm .
}

# Function to execute if Node version is < 20
run_if_node_lt_20() {
    echo '(TScript): Executing TypeScript with TypeScript Node...'
    ts-node .
}

START_TIME=$(date +%s)

# Check Node.js version and execute the corresponding function
if [ "$NODE_VERSION" -ge 20 ]; then
    run_if_node_ge_20
else
    run_if_node_lt_20
fi
