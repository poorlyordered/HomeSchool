graph TD
    %% Entry Points
    A[Landing Page] --> B{User Authentication}
    B -->|Not Authenticated| C[Sign In/Sign Up Page]
    B -->|Authenticated| D{Role Check}
    
    %% Sign Up Flow
    C -->|Sign Up| E[Role Selection]
    E -->|Guardian| F1[Email Verification]
    E -->|Student| F2[Email Verification]
    F1 -->|Verified| F[Guardian Setup Flow]
    F2 -->|Verified| G[Student Dashboard]
    
    %% Sign In Flow
    C -->|Sign In| C1{Credentials Valid?}
    C1 -->|Yes| D
    C1 -->|No| C2[Error Message]
    C2 --> C
    
    %% Password Recovery
    C -->|Forgot Password| R1[Password Reset Request]
    R1 --> R2[Reset Email Sent]
    R2 --> R3[Reset Password Form]
    R3 --> C
    
    %% Role-Based Routing
    D -->|Guardian| H{School Setup}
    D -->|Student| G
    
    %% Guardian Setup
    H -->|Not Setup| F
    H -->|Setup Complete| I[Guardian Dashboard]
    F -->|Complete School Info| I
    F -->|Cancel Setup| F3[Incomplete Setup State]
    F3 --> F
    
    %% Guardian Dashboard Features
    I --> J[Manage Students]
    I --> K[Manage Courses]
    I --> L[Manage Test Scores]
    I --> M[Generate Transcripts]
    I --> I1[Account Settings]
    
    %% Student Dashboard Features
    G --> N[View Courses]
    G --> O[View Test Scores]
    G --> P[View Transcripts]
    G --> G1[Account Settings]
    
    %% Session Expiration
    S1{Session Expired} -->|Yes| A
    
    %% Logout Paths
    I -->|Logout| A
    G -->|Logout| A
    F -->|Logout| A
    I1 -->|Logout| A
    G1 -->|Logout| A
