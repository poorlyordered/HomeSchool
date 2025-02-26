graph TD
    A[Landing Page] --> B{User Authentication}
    B -->|Not Authenticated| C[Sign In/Sign Up Page]
    B -->|Authenticated| D{Role Check}
    
    C -->|Sign Up| E[Role Selection]
    E -->|Guardian| F[Guardian Setup Flow]
    E -->|Student| G[Student Dashboard]
    
    C -->|Sign In| D
    
    D -->|Guardian| H{School Setup}
    D -->|Student| G
    
    H -->|Not Setup| F
    H -->|Setup Complete| I[Guardian Dashboard]
    
    F -->|Complete School Info| I
    
    I --> J[Manage Students]
    I --> K[Manage Courses]
    I --> L[Manage Test Scores]
    I --> M[Generate Transcripts]
    
    G --> N[View Courses]
    G --> O[View Test Scores]
    G --> P[View Transcripts]
    
    %% Logout Paths
    I -->|Logout| A
    G -->|Logout| A
    F -->|Logout| A
