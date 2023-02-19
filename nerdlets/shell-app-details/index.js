import React from 'react';
import { Button } from 'nr1';
import { navigation } from 'nr1';
import { NerdGraphQuery, Spinner, NerdletStateContext,logger, List, ListItem, BlockText } from 'nr1';
import config from '../../config';


// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class ShellTestNerdlet extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            accountId: null,
            entityGuid: null,
            entityName: null,
            initialView: true,
            stackedNerdlet: null,
            dashboardGuid: config.dashboardGuid
        }
    }


  componentDidMount() {
    const accountId = this.state.accountId;
    NerdletStateContext.subscribe((state) => { this.state.entityGuid = state.entityGuid; });
    const gql = `{
      actor {
        entity(guid: "${this.state.entityGuid}") {
          name,
          accountId
        }
      }
    }`;

    const entity = NerdGraphQuery.query({query: gql}) //The NerdGraphQuery.query method called with the query object to get your account data is stored in the accounts variable.
    entity.then(results => {
        //const name = results.data.actor.entity.name;
        this.setState({ entityName: results.data.actor.entity.name, accountId: results.data.actor.entity.accountId});
        const index = this.state.entityName.length-6;
        const shellName = this.state.entityName.substring(0, index);
          const stackedNerdlet = {
            id: 'dashboards.detail',
            urlState: {
                accountId: config.accountId,
                entityGuid: this.state.dashboardGuid,
                filters: `shellAppName = '${shellName}'`,
                useDefaultTimeRange: false
              }
          };
          navigation.openStackedNerdlet(stackedNerdlet);

    }).catch((error) => { console.log('Nerdgraph Error:', error); })
  }  

  render() {

        const entityQuery = `
        query($entityGuid: EntityGuid!) {
            actor {
                entity(guid: $entityGuid) {
                name
                }
            }
        }
        `;




    return (
      <NerdletStateContext.Consumer>
        {nerdletUrlState => {
          return (
            <NerdGraphQuery
              query={entityQuery}
              variables={{ entityGuid: nerdletUrlState.entityGuid }}
              fetchPolicyType={NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE}
            >
              {({ data, loading, error }) => {
                if (loading) {
                  return <Spinner fillContainer />;
                }

                if (error) {
                  return Error;
                }
                this.state.entityName = data.actor.entity.name;
                this.state.accountId = data.actor.entity.accountId;
                //this.state.initialView = true;
                //return <BlockText>{data.actor.entity.name}</BlockText>;
                if (this.state.entityName) {
                    console.log(this.state.initialView);
                    if (this.state.initialView){
                      const index = this.state.entityName.length-6;
                      const shellName = this.state.entityName.substring(0, index);
                      this.state.stackedNerdlet = {
                        id: 'dashboards.detail',
                        urlState: {
                            accountId: this.state.accountId,
                            entityGuid: this.state.dashboardGuid,
                            filters: `shellAppName = '${shellName}'`,
                            useDefaultTimeRange: false
                          }
                      };
                      navigation.openStackedNerdlet(this.state.stackedNerdlet);
                      this.state.initialView = false;
                    }
                  return (
                    <Button
                    spacingType={[Button.SPACING_TYPE.MEDIUM]}
                    type={Button.TYPE.PLAIN}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK}
                    onClick={() => navigation.openStackedNerdlet(this.state.stackedNerdlet)}
                    >View shelled SPA Dashboard</Button>
                  );
                } 

              }}
            </NerdGraphQuery>
          );
        }}
      </NerdletStateContext.Consumer>
    );

  }
}