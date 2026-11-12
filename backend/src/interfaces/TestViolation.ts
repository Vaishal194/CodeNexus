export interface violation{
    violation_type:'FULLSCREEN_EXIT'|
                'TAB_SWITCH'|
                'WINDOW_HIDDEN'|
                'PASTE'
    details:JSON,
    event_id:string
}