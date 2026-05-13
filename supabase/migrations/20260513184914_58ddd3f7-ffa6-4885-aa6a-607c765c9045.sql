DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT jobid, jobname FROM cron.job
    WHERE jobname ILIKE '%facebook%'
       OR jobname ILIKE '%instagram%'
       OR jobname ILIKE '%fb%'
       OR command ILIKE '%post-to-facebook%'
       OR command ILIKE '%instagram%'
  LOOP
    PERFORM cron.unschedule(r.jobid);
    RAISE NOTICE 'Unscheduled cron job: % (id %)', r.jobname, r.jobid;
  END LOOP;
END $$;