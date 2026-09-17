drop policy if exists "Admins can manage blog posts" on public.blog_posts;
create policy "Admins can manage blog posts"
on public.blog_posts for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Published blog posts are viewable by everyone" on public.blog_posts;
create policy "Published blog posts are viewable by everyone"
on public.blog_posts for select to anon, authenticated
using (status = 'published');