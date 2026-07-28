import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('supabase');

    // 1. List projects to get the project ref
    const projectsRes = await fetch('https://api.supabase.com/v1/projects', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!projectsRes.ok) {
      const txt = await projectsRes.text();
      return Response.json({ error: `Failed to list projects: ${projectsRes.status} ${txt}` }, { status: 502 });
    }
    const projectsRaw = await projectsRes.json();
    const projects = Array.isArray(projectsRaw) ? projectsRaw : (projectsRaw?.data || []);
    if (!projects || projects.length === 0) {
      return Response.json({ error: 'No Supabase projects found.', raw: projectsRaw }, { status: 404 });
    }

    // Use the first project (or let the user specify via payload)
    const body = await req.json().catch(() => ({}));
    const projectRef = body.project_ref || projects[0].ref;
    const projectName = projects.find(p => p.ref === projectRef)?.name || projects[0].name;

    // 2. Query schema (read-only)
    const schemaRes = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query/read-only`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'schema' })
      }
    );

    if (!schemaRes.ok) {
      const txt = await schemaRes.text();
      return Response.json({ error: `Schema query failed: ${schemaRes.status} ${txt}` }, { status: 502 });
    }

    const schemaData = await schemaRes.json();

    return Response.json({
      project: { ref: projectRef, name: projectName },
      availableProjects: projects.map(p => ({ ref: p.ref, name: p.name })),
      schema: schemaData
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});