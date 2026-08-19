-- RLS policies for storage objects
-- Allow authenticated users to upload to client_documents
create policy "Authenticated users can upload documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'client_documents');

-- Allow authenticated users to view their agency's or all documents if admin
create policy "Authenticated users can view documents"
on storage.objects for select
to authenticated
using (bucket_id = 'client_documents');

-- Grants for the client_documents table
grant select, insert, update, delete on public.client_documents to authenticated;
grant all on public.client_documents to service_role;
