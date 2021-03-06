/*   Profile Editing Pane
**
** Unlike most panes, this is available any place whatever the real subject,
** and allows the user to edit their own profile.
**
** Usage: paneRegistry.register('profile/profilePane')
** or standalone script adding onto existing mashlib.
*/

const nodeMode = (typeof module !== 'undefined')
var panes, UI

if (nodeMode) {
  UI = require('solid-ui')
  panes = require('../paneRegistry')
} else { // Add to existing mashlib
  panes = window.panes
  UI = panes.UI
}

const kb = UI.store
const ns = UI.ns

const thisColor = '#090'

const thisPane = { // 'noun_638141.svg' not editing
  icon: UI.icons.iconBase + 'noun_492246.svg', // noun_492246.svg for editing

  name: 'profile',

  label: function (subject) {
    var types = kb.findTypeURIs(subject)
    if (types[UI.ns.foaf('Person').uri] || types[UI.ns.vcard('Individual').uri]) {
      return 'Your Profile'
    }
    return 'Edit your profile' // At the monet, just allow on any object. Like home pane
  },

  render: function (subject, dom) {
    function paneDiv (dom, subject, paneName) {
      var p = panes.byName(paneName)
      var d = p.render(subject, dom)
      d.setAttribute('style', 'border: 0.3em solid #444; border-radius: 0.5em')
      return d
    }

    var div = dom.createElement('div')
    div.setAttribute('style', 'border: 0.3em solid ' + thisColor + '; border-radius: 0.5em; padding: 0.7em; margin-top:0.7em;')
    var table = div.appendChild(dom.createElement('table'))
    // var top = table.appendChild(dom.createElement('tr'))
    var main = table.appendChild(dom.createElement('tr'))
    var bottom = table.appendChild(dom.createElement('tr'))
    var statusArea = bottom.appendChild(dom.createElement('div'))
    statusArea.setAttribute('style', 'padding: 0.7em;')

    function comment (str) {
      var p = main.appendChild(dom.createElement('p'))
      p.setAttribute('style', 'padding: 1em;')
      p.textContent = str
      return p
    }

    function heading (str) {
      var h = main.appendChild(dom.createElement('h3'))
      h.setAttribute('style', 'color:' + thisColor + ';')
      h.textContent = str
      return h
    }

    var context = {dom: dom, div: main, statusArea: statusArea, me: null}
    UI.authn.logInLoadProfile(context).then(context => {
      var me = context.me
      subject = me

      heading('Edit your public profile')

      var profile = subject.doc()
      var editable = UI.store.updater.editable(profile.uri, kb)

      if (!editable) {
        statusArea.appendChild(UI.widgets.errorMessageBlock(dom,
          `Your profile ${subject.doc().uri} is not editable, so we cannot do much here.`))
      }

      comment(`Everything you put here will be public.
     There will be other places to record private things..`)

      heading('Your contact information')

      main.appendChild(paneDiv(dom, subject, 'contact'))

      heading('People you know who have webids')

      comment(`This is your public social network.
        Just put people here you are happy to be connected with publicly
        (You can always keep private track of friends and family in your contacts.)`)

      // TODO: would be useful to explain what it means to "drag people"
      //       what is it that is being dragged?
      //       is there a way to search for people (or things to drag) on this page?
      if (editable) comment(`Drag people onto the target below to add people.`)

      UI.widgets.attachmentList(dom, subject, main, {
        doc: profile,
        modify: !!editable,
        predicate: ns.foaf('knows'),
        noun: 'friend'
      })
      heading('Thank you for filling your profile.')
    }, err => {
      statusArea.appendChild(UI.widgets.errorMessageBlock(dom, err))
    })
    return div
  } // render()

} //

if (nodeMode) {
  module.exports = thisPane
} else {
  console.log('*** patching in live pane: ' + thisPane.name)
  panes.register(thisPane)
}
// ENDS
