import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 몬스터 러쉬 경로. 스폰 지점(0번 웨이포인트)부터 기지 근처까지
 * 순서대로 씬의 빈 노드를 등록해서 경로를 지정한다.
 */
@ccclass('RushPath')
export class RushPath extends Component {
    @property({ displayName: '경로 이름', tooltip: '예: North / South / East / West' })
    pathName: string = '';

    @property({
        type: [Node],
        displayName: '웨이포인트',
        tooltip: '0번 = 스폰 지점, 마지막 = 기지 근처. 씬 뷰에서 위치를 드래그로 조정 가능',
    })
    waypoints: Node[] = [];
}
