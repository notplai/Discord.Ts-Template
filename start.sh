#!/bin/bash

# Check Node.js version
NODE_VERSION=$(node -v | cut -d. -f1 | cut -c2-)

OutputText() {
    # Display ASCII art or other output
    cat ./assets/taag
    echo "(Flan/NodeJS) Node Version: $NODE_VERSION"
}

OutputText


# Function to execute if Node version is >= 20
run_if_node_ge_20() {
    echo '(FlanProject/TScript): Ignored TypeScriptCompiling!'
    echo '(FlanProject/JScript): Ignored JavaScript Executor!'
    echo '(FlanProject/TScript): Executing TypeScript with JavaScript Node...'

    node --no-warnings=ExperimentalWarning --loader ts-node/esm .
}

# Function to execute if Node version is < 20
run_if_node_lt_20() {
    echo '(FlanProject/TScript): Executing TypeScript with TypeScript Node...'
    ts-node .
}

START_TIME=$(date +%s)

# Check Node.js version and execute the corresponding function
if [ "$NODE_VERSION" -ge 20 ]; then
    run_if_node_ge_20
else
    run_if_node_lt_20
fi

# Loop to allow user typing commands
# while true; do
#     read -p "> " INPUT
    
#     if [ "$INPUT" == "stop" ]; then
#         echo "(FlanProject/Console): Stopping Node.js process..."
#         tmux kill-session -t $SESSION_NAME
#         echo "(FlanProject/Console): Node.js process stopped."
#         break

#     elif [ "$INPUT" == "uptime" ]; then
#         echo "(FlanProject/Uptime): Calculating uptime..."
#         # Calculate uptime
#         END_TIME=$(date +%s)
#         UPTIME=$((END_TIME - START_TIME))
        
#         # Format uptime to hours, minutes, and seconds
#         UPTIME_HOURS=$((UPTIME / 3600))
#         UPTIME_MINUTES=$(( (UPTIME % 3600) / 60 ))
#         UPTIME_SECONDS=$(( UPTIME % 60 ))

#         echo "(FlanProject/Uptime): Flan Bot uptime: ${UPTIME_HOURS}h ${UPTIME_MINUTES}m ${UPTIME_SECONDS}s"

#     elif [ "$INPUT" == "attach" ]; then
#         echo "(FlanProject/Console): Attaching to tmux session..."
#         tmux attach -t $SESSION_NAME

#     elif [ "$INPUT" == "clear" ]; then
#         echo "(FlanProject/Console): Cleaning terminal..."
#         clear

#         OutputText
#     else
#         echo "(FlanProject/Console): Unknown command '$INPUT'"
#     fi
# done