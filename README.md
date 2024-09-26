# Wildlife SOS
This repository contains the JavaScript and CSS code for a custom donation and action form developed for the nonprofit organization Wildlife SOS in **2019**. The client requested a feature that would allow users to sign a petition or take an action, and then automatically share it to their Facebook wall without needing to manually create a new post on Facebook. Users could log in with their Facebook credentials and grant permission for the website to post on their behalf.

While this functionality worked upon launch, Facebook later deprecated the API feature that allowed automatic posting to a user's wall through the JavaScript SDK. This decision came in response to privacy concerns raised in the Cambridge Analytica scandal during the presedential election. As a result, this feature no longer functions and has been removed from all of Wildlife SOS’s action forms.

A majority of the customizations can be found in the file:
* `_src/js/customen.js`: Client-specific customizations were primarily implemented here, with the main functionality located in the `shareSocial` function.