  useEffect(() => {
    // Force refresh so it checks auth on back navigation
    window.onpageshow = function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);