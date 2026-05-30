
``` mermaid
sequenceDiagram
  actor Aisha Khan
  Participant Frontend
  Participant Backend
  Participant Database

  
  Frontend ->> Backend: request map
  activate Frontend
  activate Backend
  Backend ->> Database: send query to database, fetch data of trucks
  activate Database
  Database -->> Backend: return data of truck
  Backend ->> Database: update status of truck if needed, get location via api with data
  deactivate Database

  rect rgb(0,255,0)
  Backend -->> Frontend: fetch the map
  deactivate Backend
  Frontend -->> Aisha Khan: show the map
  end

  rect rgb(255,0,0)
  Backend -->> Frontend: unable to fetch data
  Frontend -->> Aisha Khan: output error connection error
  deactivate Frontend
  end
```

---

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
