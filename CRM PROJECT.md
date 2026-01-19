CRM PROJECT



USEFUL LINKS

>>> https://medium.com/@mariajunqueira/part-3-implementing-authentication-on-our-websocket-message-service-c4dd704ef16e



WEBSOCKET AUTHENTICATION



>>> https://refine.dev/blog/how-to-multipart-upload/



MULTI PART FILE UPLOAD IN HTML



>>> https://dev.to/pbouillon/virtual-url-navigation-using-vanilla-javascript-4o38



ROUTING IN HTML WITH VANILLA JS



>>> https://www.youtube.com/watch?v=ZleShIpv5zQ

ROUTING IN HTML VIDEO AND CODE



>>> https://flowbite.com/docs/components/modal/
TAILWIND + HTML COMPONENTS TO USE









USEFUL CONTENT -

1. When you regain connection after working offline with IndexedDB, updates to your local database should be synchronized with a remote server. Here's how to handle it:



Sync Strategy:



Detect Reconnection: Use the navigator.onLine property or listen to the online event to detect when the connection is restored.

Check for Local Changes: Review the local IndexedDB for any pending updates, such as records marked with a pending status or a timestamp indicating they were modified offline.

Send Updates to Server: Use fetch() or another HTTP client to send the local changes to your backend. Ensure the request includes a unique identifier (like a timestamp or client ID) to avoid duplicates.

Update Local State: After a successful server response, update the local IndexedDB to reflect the server’s state (e.g., mark records as synced or delete them if no longer needed).

Best Practices:



Use a versioning system in IndexedDB to track changes and prevent conflicts.

Handle conflicts (e.g., same data updated both locally and remotely) by implementing a strategy like "last write wins" or prompting the user to resolve them.

Use Service Workers to manage offline sync logic, especially in Progressive Web Apps (PWAs).

Note: IndexedDB itself does not automatically sync with remote servers. You must implement the sync logic in your application code.



2\.

