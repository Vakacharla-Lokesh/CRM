FEATURES AND THINGS TO LEARN

>>> passport js for authentication

>>> batching for calling one call when first online

OAuth implementations

>>> SSOs

SQL comparison as DBs

>>> Authentication (Theory on how it works refresh token and access token)

>>> add a profile page

>>> add leads to show by organizations

>>> better folder structure

add comments properly

idempotency check when bulk uploading (modify models in mongodb)

>>> soft delete for users and tenants

>>> isactive for users field in users model in mongodb

>>> pagination

>>> searching

>>> export things on frontend

>>> calculate score

exponential fallback with jitter to add rate limiter

>>> indexes to all the models

>>> rate limit functions using package

>>> refresh token implementation

>>> search feature implement (backend)

fix dashboard stats? need? (currently using promise.all)

>>> edit deal validation error

admin can assign leads

>>> fix settings modal to look better

>>> fix vercel deployment issues

>>> connect render to vercel

caching? using upstash?

>>> otp validation for password reset or forgot password

test all features

>>> better login page

>>> mail to instead of copy id in action drop downs

super admin should have more features

web socket implementation in server

>>>notifications panel

>>> navbar for login pages

>>> toast notifications in project

>>> when tenant is created a new admin is automatically created and mail is sent to admin with password

>>>fix comments in all files in front end



TODO
25/02/2026 - NEW FEATURES LEFT TO ADD - 

sqs

>>> DONE api validations 

>>> DONE worker thread in frontend for exports

>>> DONE export using fastcsv and send from backend

>>> DONE import csv for leads, deals, organizations

>>> NO NEED FOR NOW passport js fix by removing own auth middleware

<<< NO NEED FOR MULTER multer for attachment uploads

zustand

documentation

profile photo upload to cloudinary/ local stack bucket

>>> DONE local stack download

bull mq

>>> local stack installation

nginx and pm2? 

TODO
web socket implementations to broadcast notifications and live activities

centralized note taking to relate to any thing, like lead, deal, org, etc

bulk delete operations

>>>offline sync queue through sqs as well

customizable dashboards?? (from twenty)

kanban board type view?

Sales Gamification (Leaderboards).

>>>pm2 clustering implementations

Idempotency key enforcement

>>>atlas search instead of regex pattern matching

WebSockets (Tenant-Wide Notifications) - see how to implement a redis pub sub to broadcast to all instances of node

>>>timeline feature for leads, organizations

>>>automations / triggers on particular actions (create a new collection for triggers and then add a pub sub or queue to process these triggers)

dynamic rules and assign roles to users within tenant

tasks and notes??

fast csv pipe to stream to send data to controller

lead score engine better

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


TODO: 27/02/2026

>>>socket io for activity within tenant

widgets for dashboard and (rearrange widgets)

>>>tenant based settings

>>>tasks new tab per user in kanban type page and create through workflows

start up login and flow on first login, send a link instead of password and credentials, reset password and take in profile data

calender to show leads, deals and organizations created


TODO 02/03/2026

>>>remove retry logic for create

>>>custom select color and custom scroll bars

>>>caching added for role permissions

webhook connections to other projects?

>>>otp logic to redis


>>> commands
pm2 start ecosystem.config.js

pm2 stop ecosystem.config.js


TODO 03/03/2026

test website to track lead activity

>>>assign leads to users

>>>permissions fix of users and their roles

>>>webhook integration

tickets section is mentioned in crms?

>>>tasks or notes section

campaign and email templates section to send emails based on template to the lead (use markdown editor for html body of emails).

tenant based settings to enable customizations

leaderboards tab to show which user is closing most deals or leads (but implemented in custom analytics dashboard where user can create custom dashboards)

invoice creation on deal won or lead converted

>>>add redis for dashboard analytics to prevent db calls

snapshots of all the analytics data and then merge them with latest data to provide aggregated data

job process tracking using a redis pub sub

since pm2 is being used a separate redis pub sub for socket connections for live data display or notifications

>>>move rate limiter to redis instead of in memory

multi currency support

>>>move dashboard analytics to cache and refresh button for sse when a new event occurs


TODO 05/03/2026


complete start to finish workflow from lead creation to finished in deal, stream and how lead is created, track which user brings how much value to company, deadlines, pipeline stages for leads conversion, invoice generation for deal conversion, 

what is value proposition of this?

what is the need for this?

if this goes out of business tomorrow? what it would need?

transaction type configuration like snapshot, read concern, write concern

job process tracking using a redis pub sub

now when a job is added to a queue, i need to track the status

PACKAGES - 
https://www.npmjs.com/package/@hello-pangea/dnd