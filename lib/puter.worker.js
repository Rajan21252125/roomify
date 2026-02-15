
const PROJECT_PREFIX = 'roomify_project_'
const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch (error) {
        return null;
    }
}


router.post('/api/projects/save', async ({ request, response }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) {
            return jsonError(401, 'Unauthorized')
        }

        const body = await request.json();
        const project = body?.project;

        if (!project?.id || !project?.sourceImage) {
            return jsonError(400, 'Project Not found');
        }

        const payload = {
            ...project,
            updatedAt: new Date().toISOString()
        };

        const userId = await getUserId(payload);
        if (!userPuter) {
            return jsonError(401, 'Unauthorized')
        }

        const key = `${PROJECT_PREFIX}${project.id}`;

        await userPuter.kv.put(key, JSON.stringify(payload));

        return { saved: true, id: project.id, project: payload };


    } catch (error) {
        return jsonError(500, 'Failed to save project', { message: error.message || 'Unknown error' })
    }
})

router.get('/api/projects/list', async ({ request }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) {
            return jsonError(401, 'Unauthorized');
        }

        const userId = await getUserId(userPuter);
        if (!userId) {
            return jsonError(401, 'Unauthorized');
        }


        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true)).map(({ value }) => ({ ...value, isPublic: true }))

        return { projects };
    } catch (error) {
        return jsonError(500, 'Failed to list projects', { message: error.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async ({ request }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) {
            return jsonError(401, 'Unauthorized');
        }

        const userId = await getUserId(userPuter);
        if (!userId) {
            return jsonError(401, 'Unauthorized');
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return jsonError(400, 'Missing project ID');
        }

        const key = `${PROJECT_PREFIX}${id}`;
        const value = await userPuter.kv.get(key);

        if (!value) {
            return jsonError(404, 'Project not found');
        }

        return JSON.parse(value);

    } catch (error) {
        return jsonError(500, 'Failed to get project', { message: error.message || 'Unknown error' });
    }
})