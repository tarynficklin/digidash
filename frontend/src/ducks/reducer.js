const initialState = {
  user_id: null,
  user_name: 'GUEST',
  user_email: '',
  user_bg:
    'https://images.unsplash.com/photo-1536130371825-ac75012d9b24?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c1c97eb0f52f1174d7a8281dd8348828&auto=format&fit=crop&w=1050&q=80',
  color: '115, 164, 191',
  theme: 'dark',
  flavor: 'modern',
  compact: true,
  collision: false,
  locked: true,
};

const SET_USER = 'SET_USER';
const SET_THEME = 'SET_THEME';
const SET_COLOR = 'SET_COLOR';
const SET_BG = 'SET_BG';
const SET_FLAVOR = 'SET_FLAVOR';
const SET_COLLISION = 'SET_COLLISION';
const SET_COMPACT = 'SET_COMPACT';
const SET_LOCK = 'SET_LOCK';
const DELETE_USER = 'DELETE_USER';

export function setUser(val) {
  return { type: SET_USER, payload: val };
}
export function setTheme(val) {
  return { type: SET_THEME, payload: val };
}
export function setColor(val) {
  return { type: SET_COLOR, payload: val };
}
export function setBG(val) {
  return { type: SET_BG, payload: val };
}
export function setFlavor(val) {
  return { type: SET_FLAVOR, payload: val };
}
export function setCollision(val) {
  return { type: SET_COLLISION, payload: val };
}
export function setCompact(val) {
  return { type: SET_COMPACT, payload: val };
}
export function setLock(val) {
  return { type: SET_LOCK, payload: val };
}
export function deleteUser() {
  return { type: DELETE_USER };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, action.payload);
    case SET_THEME:
      return Object.assign({}, state, { theme: action.payload });
    case SET_COLOR:
      return Object.assign({}, state, { color: action.payload });
    case SET_BG:
      return Object.assign({}, state, { user_bg: action.payload });
    case SET_FLAVOR:
      return Object.assign({}, state, { flavor: action.payload });
    case SET_COLLISION:
      return Object.assign({}, state, { collision: !state.collision });
    case SET_COMPACT:
      return Object.assign({}, state, { compact: !state.compact });
    case SET_LOCK:
      return Object.assign({}, state, { locked: !state.locked });
    case DELETE_USER:
      return Object.assign({}, state, {
        user_id: null,
        user_name: '',
        user_email: '',
        user_bg:
          'https://images.unsplash.com/photo-1536130371825-ac75012d9b24?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c1c97eb0f52f1174d7a8281dd8348828&auto=format&fit=crop&w=1050&q=80',
        color: '115, 164, 191',
        theme: 'dark',
        flavor: 'modern',
        compact: true,
        collision: false,
        locked: true,
      });
    default:
      return state;
  }
}
