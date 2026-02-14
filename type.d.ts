interface AuthState {
    isSignedIn: boolean;
    user: string | null;
    userId: string | null;
}

type AuthContext = {
    isSignedIn: boolean;
    user: string | null;
    userId: string | null;
    refeshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<boolean>;
}