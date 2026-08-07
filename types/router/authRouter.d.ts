export declare const authRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: import("../context").Context;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    register: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            username: string;
            email: string;
            password: string;
        };
        output: {
            user: import("../auth/publicUser").PublicUser;
            csrfToken: string;
        };
        meta: object;
    }>;
    login: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            email: string;
            password: string;
        };
        output: {
            user: import("../auth/publicUser").PublicUser;
            csrfToken: string;
        };
        meta: object;
    }>;
    logout: import("@trpc/server").TRPCMutationProcedure<{
        input: void;
        output: {
            success: boolean;
        };
        meta: object;
    }>;
    refresh: import("@trpc/server").TRPCMutationProcedure<{
        input: void;
        output: {
            success: boolean;
            csrfToken: string;
        };
        meta: object;
    }>;
    me: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
            user: import("../auth/publicUser").PublicUser;
        };
        meta: object;
    }>;
}>>;
