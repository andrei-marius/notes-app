const config = {
    apiKey: "AIzaSyD2ly17tCK8X4ElMmiTqf2EBI6m_A_jZ8o",
    authDomain: "notes-app-f5d00.firebaseapp.com",
    projectId: "notes-app-f5d00",
    storageBucket: "notes-app-f5d00.appspot.com",
    messagingSenderId: "635334166326",
    appId: "1:635334166326:web:5e67f14fcf7ec87caa5597"
};
firebase.initializeApp(config);
const db = firebase.firestore();

const container = document.querySelector('#container-notes')
const form = document.querySelector('form')
const search = document.querySelector('#search')

const getNotes = () => {
    db.collection('notes').orderBy('created_at', 'asc').get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            addNote(doc.data(), doc.id)
        });
    }).catch(err => {
        console.log(err)
    })
}

db.collection('notes').orderBy('created_at', 'asc').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        const doc = change.doc
        if(change.type === 'added'){
            addNote(doc.data(), doc.id)
        }else if(change.type === 'removed'){
            removeNote(doc.id)
        }else if(change.type === 'modified'){
            // updateNote(doc.id, doc.data())
            container.innerHTML = ''
            getNotes()
        }
    })
})

const addNote = (note, id) => {
    const date = note.created_at.toDate().toString().substring(4, 15)
    const time = note.created_at.toDate().toString().substring(16, 24)

    let html = `<div data-id="${id}" class="note">
        <br>
        <input value="${note.title}" class="title text" type="text">
        <input value="${note.body}" class="body text" type="text">
        <button>DELETE</button>
        <button>UPDATE</button>
        <input class="important" type="checkbox">
        <label>Important</label>
        <br>
        <div class="date">Added on ${date}, at ${time}</div>
        <hr>
    </div>`

    container.insertAdjacentHTML("afterbegin", html);

    const parentElmt = document.querySelector(`[data-id='${id}']`)
    
    if(note.important === true ){
        parentElmt.childNodes[11].setAttribute('checked', 'true')
    }
}

const removeNote = id => {
    const notes = document.querySelectorAll('.note')

    notes.forEach(note => {
        if(note.getAttribute('data-id') === id){
            note.remove()
        }
    })
}

// const updateNote = (id, note) => {
//     const parentElmt = document.querySelector(`[data-id='${id}']`)

//     parentElmt.childNodes[3].value = note.title
//     parentElmt.childNodes[5].value = note.body
//     parentElmt.childNodes[15].checked = note.important
    
// }

form.addEventListener('submit', e => {
    e.preventDefault()

    if(form.title.value.length > 0 && form.body.value.length > 0){
        const now = new Date()

        const note = {
            title: form.title.value,
            body: form.body.value,
            created_at: firebase.firestore.Timestamp.fromDate(now),
            important: false
        }
    
        db.collection('notes').add(note).then(() => {
            console.log('created')
            form.reset()
        }).catch(err => {
            console.log(err)
        })
    }
})

container.addEventListener('click', e => {
    if(e.target.tagName === 'BUTTON' && e.target.innerText === 'DELETE'){
        const id = e.target.parentElement.getAttribute('data-id')

        db.collection('notes').doc(id).delete().then(() => {
            console.log('deleted')
        })
    }else if(e.target.tagName === 'BUTTON' && e.target.innerText === 'UPDATE' &&
        e.target.parentElement.childNodes[3].value.length > 0 && e.target.parentElement.childNodes[5].value.length > 0){
        const id = e.target.parentElement.getAttribute('data-id')
       
        const updatedNote = {
            title: e.target.parentElement.childNodes[3].value,
            body: e.target.parentElement.childNodes[5].value,
            important: e.target.parentElement.childNodes[11].checked
        }

        db.collection('notes').doc(id).update(updatedNote).then(() => {
            console.log('updated')
        }).catch(err => {
            console.log(err)
        })
    }
})

search.addEventListener('input', e => {
    if(search.value.length > 0){
        container.innerHTML = ''

        db.collection('notes').orderBy('created_at', 'asc').where('title', '==', e.target.value)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                addNote(doc.data(), doc.id)
            })
        })
        .catch(err => {
            console.log(err)
        })
    }else{
        container.innerHTML = ''
        getNotes()
    }
})

document.querySelector('#showImportant').addEventListener('click', () => {
    container.innerHTML = ''

    db.collection('notes').orderBy('created_at', 'asc').where('important', '==', true)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                addNote(doc.data(), doc.id)
            })
        })
        .catch(err => {
            console.log(err)
        })
})