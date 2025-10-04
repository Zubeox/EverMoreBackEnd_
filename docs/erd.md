# Database Entity-Relationship Diagram

```mermaid
erDiagram
    client_galleries {
        uuid id PK
        timestamptz created_at
        timestamptz updated_at
        text client_email
        text client_name
        text bride_name
        text groom_name
        date wedding_date
        text gallery_slug UK
        text access_code UK
        text cover_image
        text[] images
        timestamptz expiration_date
        text status "active|expired|archived|draft"
        timestamptz last_accessed_at
        integer view_count
        boolean allow_downloads
        text welcome_message
        text admin_notes
    }

    client_images {
        uuid id PK
        timestamptz created_at
        uuid gallery_id FK
        text image_url
        text thumbnail_url
        text title
        integer order_index
    }

    client_gallery_analytics {
        uuid id PK
        uuid gallery_id FK
        text client_email
        timestamptz viewed_at
        text ip_address
        text user_agent
        integer session_duration
    }

    client_gallery_downloads {
        uuid id PK
        uuid gallery_id FK
        text image_public_id
        timestamptz downloaded_at
        text download_type "single|zip_all|zip_favorites"
        text client_email
        integer image_count
    }

    client_gallery_favorites {
        uuid id PK
        uuid gallery_id FK
        text image_public_id
        timestamptz favorited_at
        text client_email
    }

    galleries {
        uuid id PK
        timestamptz created_at
        text title
        text subtitle
        date event_date
        text cover_image
        text[] images
    }

    partners {
        uuid id PK
        timestamptz created_at
        timestamptz updated_at
        text name
        text category "venue|florist|planner|caterer|decorator|music|other"
        text description
        text logo_url
        text website
        text email
        text phone
        boolean featured
        integer display_order
        boolean is_active
    }

    partnership_inquiries {
        uuid id PK
        timestamptz created_at
        text name
        text email
        text phone
        text company_name
        text company_category
        text website
        text message
        text status "pending|approved|rejected"
        text notes
    }

    contacts {
        uuid id PK
        timestamptz created_at
        text name
        text email
        text phone
        text message
    }

    %% Relationships
    client_galleries ||--o{ client_images : "has many"
    client_galleries ||--o{ client_gallery_analytics : "tracks views"
    client_galleries ||--o{ client_gallery_downloads : "tracks downloads"
    client_galleries ||--o{ client_gallery_favorites : "has favorites" 
