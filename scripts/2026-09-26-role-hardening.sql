-- Bicho Core. Conserva administradores existentes; impide autoasignacion de roles.
BEGIN;
SET LOCAL lock_timeout='5s';
ALTER POLICY user_roles_insert ON public.user_roles
  WITH CHECK (public.is_admin(auth.uid()));
-- La politica anterior se consultaba a si misma y podia causar recursion RLS.
ALTER POLICY "Admin read user_roles" ON public.user_roles
  USING (public.is_admin(auth.uid()));
COMMIT;
