import Component from "@glimmer/component";
// import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";

export default class MyOutletComponent extends Component {
  didInsert() {
    // This hook runs after the component has updated, including when
    // its arguments (from the outlet) have changed.
    console.log("Outlet content inserted!");
    // Perform actions based on updated data event:($PageView) AND properties.$service.keyword:"message"
  }

  <template>
    <div
      {{ didInsert this.didInsert }}
    >
      asdasd
    </div>
  </template>
}
