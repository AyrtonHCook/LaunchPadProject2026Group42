Get truck locations
``` mermaid
sequenceDiagram
  actor  Aisha Khan
  participant Frontend
  participant Backend
  participant Database

  Aisha Khan ->> Frontend: Open map
  Frontend ->> Backend: request current food trucks locations and status
  activate Frontend
  activate Backend
  
  Backend ->> Database: fetch current food trucks locations and status
  activate Database
  Database -->> Backend: return locations send locatins again when its updated
  deactivate Database

  rect rgb(0,255,0)
  Backend -->> Frontend: load locations and status on the map and update when received update
  deactivate Backend
  end

  rect rgb(255,0,0)
  Database -->> Backend: connection failed
  Backend -->> Frontend: unable to get data, load error message
  end
  Frontend -->> Aisha Khan: view output
```
---

view recources available

``` mermaid
sequenceDiagram
actor Aisha Khan
participant Frontend
participant Backend
participant Database

Aisha Khan ->> Frontend: load page
Frontend ->> Backend: request resource data
activate Frontend
activate Backend
Backend ->> Database: fetch data
activate Database

rect rgb(0,255,0)
Database -->> Backend: return data, resent data if update detected
Backend -->> Frontend: load data, update data if needed
Frontend -->> Aisha Khan: view data
end

rect rgb(255,0,0)
Database -->> Backend: unable to return data
deactivate Database
Backend -->> Frontend: load error message in a popup
deactivate Backend
Frontend -->> Aisha Khan: view results
deactivate Frontend
end
```
