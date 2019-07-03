import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon, OverlayTrigger, Tooltip } from 'patternfly-react';
import { style } from 'typestyle';
import { Paths } from '../../config';

type Props = {
  name: string;
};

const iconStyle = style({
  paddingLeft: 10,
  paddingRight: 10
});

class OverviewCardLinks extends React.Component<Props> {
  render() {
    return (
      <div style={{ marginTop: '10px' }}>
        <OverlayTrigger key="ot_graph" placement="top" overlay={<Tooltip id="tt_graph">前往图表页面</Tooltip>}>
          <Link to={`/graph/namespaces?namespaces=` + this.props.name}>
            <Icon type="pf" name="topology" className={iconStyle} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger key="ot_apps" placement="top" overlay={<Tooltip id="tt_apps">前往应用页面</Tooltip>}>
          <Link to={`/${Paths.APPLICATIONS}?namespaces=` + this.props.name}>
            <Icon type="pf" name="applications" className={iconStyle} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger
          key="ot_workloads"
          placement="top"
          overlay={<Tooltip id="tt_workloads">前往工作流量页面</Tooltip>}
        >
          <Link to={`/${Paths.WORKLOADS}?namespaces=` + this.props.name}>
            <Icon type="pf" name="bundle" className={iconStyle} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger key="ot_services" placement="top" overlay={<Tooltip id="tt_services">前往服务页面</Tooltip>}>
          <Link to={`/${Paths.SERVICES}?namespaces=` + this.props.name}>
            <Icon type="pf" name="service" className={iconStyle} />
          </Link>
        </OverlayTrigger>
        <OverlayTrigger key="ot_istio" placement="top" overlay={<Tooltip id="tt_istio">前往Istio配置页面</Tooltip>}>
          <Link to={`/${Paths.ISTIO}?namespaces=` + this.props.name}>
            <Icon type="pf" name="template" className={iconStyle} />
          </Link>
        </OverlayTrigger>
      </div>
    );
  }
}

export default OverviewCardLinks;
