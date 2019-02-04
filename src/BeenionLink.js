import { h } from 'preact'

export const BeenionLink = ({ favicon, title, url }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
    <div style={{ textAlign: 'left', paddingLeft: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {favicon ? (
          <img width="13" alt=" " src={favicon} />
        ) : (
          <span style={{ width: 13 }} />
        )}
        <div
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: '#666',
            fontWeight: '500',
            fontFamily: 'PingFang SC, Arial',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: 200,
            paddingLeft: 4
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          color: '#a2a2a2',
          fontSize: 11,
          textOverflow: 'ellipsis',
          width: 200,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: 'PingFang SC, Arial',
          paddingTop: 2
        }}
      >
        {url}
      </div>
    </div>
  </div>
)